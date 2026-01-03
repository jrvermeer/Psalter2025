// See https://aka.ms/new-console-template for more information
using Sandbox;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

internal class Program
{
    const string NG_PUBLIC_FOLDER = "C:\\Users\\verme\\source\\repos\\Psalter2025\\Psalter2025\\public\\";
    private static async Task Main(string[] args)
    {
        //await Migrate1912ToNewSchema();
        Add2025RecsForScoreImages();
    }

    private static void Add2025RecsForScoreImages()
    {
        var files = Directory.GetFiles($"{NG_PUBLIC_FOLDER}2025\\Score");
        var newPsalters = Get2025Psalters();

        var filesSanitized = files
            .Select(x => Path.GetFileName(x))
            .Select(x => new
            {
                ScoreFilePath = $"2025/Score/{x}",
                Number = int.Parse(new string(x.TrimStart("_").TakeWhile(x => char.IsNumber(x)).ToArray())),
                Letter = x.SkipWhile(x => !char.IsLetter(x)).FirstOrDefault().ToString(),
                IsRefrain = x.ToLower().Contains("_refrain")
            }).ToList();

        foreach (var psalterFiles in filesSanitized.GroupBy(x => new {x.Number, x.Letter }))
        {
            var matchingPsalter = newPsalters.FirstOrDefault(x => x.Number == psalterFiles.Key.Number && x.Letter == psalterFiles.Key.Letter);
            if (matchingPsalter == null)
            {
                matchingPsalter = new NewSchema
                {
                    Number = psalterFiles.Key.Number,
                    Letter = psalterFiles.Key.Letter,
                    Verses = []                    
                };
                newPsalters.Add(matchingPsalter);
            }
            matchingPsalter.ScoreFiles = psalterFiles.Select(x => x.ScoreFilePath).ToList();
            matchingPsalter.Verses ??= [];
        }
        newPsalters = newPsalters.OrderBy(x => x.Number).ThenBy(x => x.Letter).ToList();

        WriteJson($"{NG_PUBLIC_FOLDER}2025\\psalter.json", newPsalters);
    }

    private static async Task Migrate1912ToNewSchema()
    {
        var json = await File.ReadAllTextAsync($"{AppDomain.CurrentDomain.BaseDirectory}\\psalter_oldschema.json");
        var oldSchema = JsonSerializer.Deserialize<List<OldSchema>>(json);
        var newSchema = oldSchema.Select(x => Convert(x)).ToList();
        var newPsalters = Get2025Psalters();

        foreach (var newPsalter in newPsalters)
        {
            var oldPsalter = newSchema.FirstOrDefault(x => x.Number.ToString() == newPsalter.OtherPsalterNumber);
            if (oldPsalter != null)
                oldPsalter.OtherPsalterNumber = newPsalter.Number + newPsalter.Letter;
        }

        WriteJson($"{NG_PUBLIC_FOLDER}1912\\psalter.json", newSchema);
    }

    private static void WriteJson(string path, List<NewSchema> newSchema)
    {
        File.WriteAllText(path, JsonSerializer.Serialize(newSchema, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping // don't serialize apostrophes as \u000
        }));
    }

    private static List<NewSchema> Get2025Psalters()
    {
        var newPsalterJson = File.ReadAllText($"{NG_PUBLIC_FOLDER}2025\\psalter.json");
        return JsonSerializer.Deserialize<List<NewSchema>>(newPsalterJson, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }

    private static NewSchema Convert(OldSchema old)
    {
        var oldVerses = old.lyrics.Split("\n\n").ToList();
        var chorus = oldVerses.FirstOrDefault(x => x.StartsWith("(CHORUS"));

        if (chorus != null)
        {
            // todo: handle x2
            oldVerses.Remove(chorus);
            var repeatTwice = chorus.Contains("x2");
            chorus = chorus.Substring(chorus.IndexOf("\n")).Trim();
            if (repeatTwice)
                chorus += "\n" + chorus;
        }

        var newSchema = new NewSchema
        {
            Number = old.number,
            SecondTune = old.Title.Contains("2nd") ? true : null,

            Title = old.heading,
            Psalm = old.psalm,
            Verses = oldVerses.Select(x => RemoveVerseNumber(x).Trim()).ToList(),
            Chorus = chorus,
            NumVersesInsideStaff = old.NumVersesInsideStaff,
            ScoreFiles = [old.scoreFileName],            
        };

        newSchema.AudioFile = $"1912\\Audio\\_{old.number}{(newSchema.SecondTune.GetValueOrDefault() ? "_2" : "")}.mp3";
        if (!File.Exists($"{NG_PUBLIC_FOLDER}{newSchema.AudioFile}"))
            newSchema.AudioFile = null;

        return newSchema;
    }

    public static string RemoveVerseNumber(string verse)
    {
        return new string(verse.SkipWhile(x => char.IsNumber(x) || x == '.' || x == ' ').ToArray());
    }
}

public class OldSchema
{
    public int NumVersesInsideStaff { get; set; }
    public string Title {get; set;}
    public int _id {get; set;}
    public string audioFileName {get; set;}
    public string heading {get; set;}
    public int isFavorite {get; set;}
    public string lyrics {get; set;}
    public int number {get; set;}
    public int numverses {get; set;}
    public int? psalm {get; set;}
    public string scoreFileName { get; set; }
}

public class NewSchema
{
    public required int Number { get; set; }
    public string? Letter { get; set; } // 2025
    public bool? SecondTune { get; set; } // 1912

    public string Title { get; set; }
    public int? Psalm { get; set; }
    public string? PsalmVerses { get; set; } // 2025
    public bool? IsCompletePsalm { get; set; } // 2025

    public List<string> Verses { get; set; }
    public string? Chorus { get; set; }
    public int? NumVersesInsideStaff { get; set; } // 1912
    public List<string> ScoreFiles { get; set; }
    public string? AudioFile { get; set; }
    public string? OtherPsalterNumber { get; set; }
}