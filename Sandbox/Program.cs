// See https://aka.ms/new-console-template for more information
using Sandbox;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

internal class Program
{
    const string NG_PUBLIC_FOLDER = "C:\\Users\\verme\\source\\repos\\Psalter2025\\Psalter2025\\public\\";
    private static async Task Main(string[] args)
    {
        var json = await File.ReadAllTextAsync("C:\\Users\\verme\\Downloads\\psalter_oldschema.json");
        var oldSchema = JsonSerializer.Deserialize<List<OldSchema>>(json);
        var newSchema = oldSchema.Select(x => Convert(x)).ToList();

        var newPsalterJson = File.ReadAllText($"{NG_PUBLIC_FOLDER}2025\\psalter.json");
        var newPsalters = JsonSerializer.Deserialize<List<NewSchema>>(newPsalterJson, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        foreach (var newPsalter in newPsalters)
        {
            var oldPsalter = newSchema.FirstOrDefault(x => x.Number.ToString() == newPsalter.OtherPsalterNumber);
            if (oldPsalter != null)
                oldPsalter.OtherPsalterNumber = newPsalter.Number + newPsalter.Letter;
        }

        File.WriteAllText($"{NG_PUBLIC_FOLDER}1912\\psalter.json", JsonSerializer.Serialize(newSchema, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping // don't serialize apostrophes as \u000
        }));
    }

    private static NewSchema Convert(OldSchema old)
    {
        var oldVerses = old.lyrics.Split("\n\n").ToList();
        var chorus = oldVerses.FirstOrDefault(x => x.StartsWith("(CHORUS"));

        if (chorus != null)
        {
            // todo: handle x2
            oldVerses.Remove(chorus);
            chorus = chorus.Substring(chorus.IndexOf("\n")).Trim();
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

    public required string Title { get; set; }
    public int? Psalm { get; set; }
    public string? PsalmVerses { get; set; } // 2025
    public bool? IsCompletePsalm { get; set; } // 2025

    public required List<string> Verses { get; set; }
    public string? Chorus { get; set; }
    public int? NumVersesInsideStaff { get; set; } // 1912
    public required List<string> ScoreFiles { get; set; }
    public string? AudioFile { get; set; }
    public string? OtherPsalterNumber { get; set; }
}